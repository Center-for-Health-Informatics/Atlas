# check=skip=SecretsUsedInArgOrEnv
# ATLAS_USER_AUTH_ENABLED and ATLAS_REFRESH_TOKEN_THRESHOLD below trip
# buildkit's secret-name heuristic (AUTH/TOKEN substrings) but are a boolean
# feature flag and a numeric duration in seconds, not credentials.

# Build the source.
#
# Pinned to $BUILDPLATFORM (the machine running the build) rather than the
# target platform: everything this stage emits is a Vite bundle -- JS, CSS,
# HTML, gzip -- which is architecture-neutral. So when cross-building the
# linux/amd64 image from an arm64 Mac, npm and vite run *natively* instead of
# under QEMU, and both architectures share one build. Only the nginx runtime
# stage below is genuinely per-architecture.
FROM --platform=$BUILDPLATFORM docker.io/library/node:lts-slim AS builder

WORKDIR /code

# First install dependencies. This part will be cached as long as
# package.json and package-lock.json remain identical. `npm ci` rather than
# `npm install` so the image is built from the committed lockfile.
COPY package.json package-lock.json /code/
RUN npm ci

# Build code. images/ is needed here too (not just in the final stage) --
# index.html references favicon.ico/atlas_loading.svg/ohdsi_color.png, and
# Vite needs the real files present to resolve, hash, and copy them into the
# build output; without it, Vite silently leaves those references untouched
# instead of erroring, which is easy to miss.
COPY ./vite.config.js /code/vite.config.js
COPY ./build /code/build
COPY ./js /code/js
COPY ./images /code/images
COPY ./index.html /code/index.html

# Set explicitly (rather than relying on vite build's implicit default) so the
# production build mode is self-documenting. Must come after `npm ci`, since
# vite itself is a devDependency npm would skip installing if NODE_ENV were
# already "production" at install time.
ENV NODE_ENV=production
RUN npm run build:docker

# Statically pre-compress all output files to be served
RUN find . -type f "(" \
        -name "*.css" \
        -o -name "*.html" \
        -o -name "*.js" ! -name "runtime-config.js" \
        -o -name "*.json" \
        -o -name "*.svg" \
        -o -name "*.xml" \
      ")" -print0 \
      | xargs -0 -n 1 gzip -kf

# Production Nginx image.
#
# The digest pin must refer to a multi-arch *image index*, not a single
# platform's manifest -- otherwise the linux/amd64 and linux/arm64 legs of the
# build both resolve to whatever one architecture the digest names, and the
# mismatch shows up only at run time on the deployment host. Verify before
# bumping:
#     podman manifest inspect docker.io/nginxinc/nginx-unprivileged@sha256:...
# and check for `"mediaType": "application/vnd.oci.image.index.v1+json"` with
# both amd64 and arm64 entries.
FROM docker.io/nginxinc/nginx-unprivileged:1.28.0-bookworm@sha256:cd33960e98e93d4d63385790ff7f8f5bf2ca95184c581b7f42ae8aea1139fbfc

# Supplied by build.sh so a deployed image can be traced back to a commit.
ARG VERSION=dev
ARG REVISION=unknown
ARG CREATED=

LABEL org.opencontainers.image.title="OHDSI-Atlas"
LABEL org.opencontainers.image.version="$VERSION"
LABEL org.opencontainers.image.revision="$REVISION"
LABEL org.opencontainers.image.created="$CREATED"
LABEL org.opencontainers.image.authors="Joris Borgdorff <joris@thehyve.nl>, Lee Evans - www.ltscomputingllc.com, Shaun Turner<shaun.turner1@nhs.net>"
LABEL org.opencontainers.image.description="ATLAS is an open source software tool for researchers to \
conduct scientific analyses on standardized observational data"
LABEL org.opencontainers.image.licenses="Apache-2.0"
LABEL org.opencontainers.image.vendor="OHDSI"
LABEL org.opencontainers.image.source="https://github.com/Center-for-Health-Informatics/Atlas"

# Documentation only -- nginx-unprivileged cannot bind :80 as a non-root user,
# so docker/nginx-default.conf listens on 8080 and the compose file maps to it.
EXPOSE 8080

# URL where WebAPI can be queried by the client
ENV USE_DYNAMIC_WEBAPI_URL="false"
ENV DYNAMIC_WEBAPI_SUFFIX="/WebAPI/"
ENV WEBAPI_URL="http://localhost:8080/WebAPI/"
ENV CONFIG_PATH="/etc/atlas/config-local.js"
ENV ATLAS_INSTANCE_NAME="OHDSI"
ENV ATLAS_COHORT_COMPARISON_RESULTS_ENABLED="false"
ENV ATLAS_USER_AUTH_ENABLED="false"
ENV ATLAS_PLP_RESULTS_ENABLED="false"
ENV ATLAS_CLEAR_LOCAL_STORAGE="false"
ENV ATLAS_ENABLE_PERMISSIONS_MGMT="true"
ENV ATLAS_CACHE_SOURCES="false"
ENV ATLAS_POLL_INTERVAL="60000"
ENV ATLAS_SKIP_LOGIN="false"
ENV ATLAS_USE_EXECUTION_ENGINE="false"
ENV ATLAS_VIEW_PROFILE_DATES="false"
ENV ATLAS_ENABLE_COSTS="false"
ENV ATLAS_SUPPORT_URL="https://github.com/ohdsi/atlas/issues"
ENV ATLAS_SUPPORT_MAIL="atlasadmin@your.org"
ENV ATLAS_FEEDBACK_CONTACTS="For access or questions concerning the Atlas application please contact:"
ENV ATLAS_FEEDBACK_HTML=""
ENV ATLAS_COMPANYINFO_HTML=""
ENV ATLAS_COMPANYINFO_SHOW="true"
ENV ATLAS_DEFAULT_LOCALE="en"

ENV ATLAS_SECURITY_WIN_PROVIDER_ENABLED="false"
ENV ATLAS_SECURITY_WIN_PROVIDER_NAME="Windows"
ENV ATLAS_SECURITY_WIN_PROVIDER_URL="user/login/windows"
ENV ATLAS_SECURITY_WIN_PROVIDER_AJAX="true"
ENV ATLAS_SECURITY_WIN_PROVIDER_ICON="fab fa-windows"

ENV ATLAS_SECURITY_KERB_PROVIDER_ENABLED="false"
ENV ATLAS_SECURITY_KERB_PROVIDER_NAME="Kerberos"
ENV ATLAS_SECURITY_KERB_PROVIDER_URL="user/login/kerberos"
ENV ATLAS_SECURITY_KERB_PROVIDER_AJAX="true"
ENV ATLAS_SECURITY_KERB_PROVIDER_ICON="fab fa-windows"

ENV ATLAS_SECURITY_OID_PROVIDER_ENABLED="false"
ENV ATLAS_SECURITY_OID_PROVIDER_NAME="OpenID Connect"
ENV ATLAS_SECURITY_OID_PROVIDER_URL="user/login/openid"
ENV ATLAS_SECURITY_OID_PROVIDER_AJAX="false"
ENV ATLAS_SECURITY_OID_PROVIDER_ICON="fa fa-openid"

ENV ATLAS_SECURITY_GGL_PROVIDER_ENABLED="false"
ENV ATLAS_SECURITY_GGL_PROVIDER_NAME="Google"
ENV ATLAS_SECURITY_GGL_PROVIDER_URL="user/oauth/google"
ENV ATLAS_SECURITY_GGL_PROVIDER_AJAX="false"
ENV ATLAS_SECURITY_GGL_PROVIDER_ICON="fab fa-google"

ENV ATLAS_SECURITY_FB_PROVIDER_ENABLED="false"
ENV ATLAS_SECURITY_FB_PROVIDER_NAME="Facebook"
ENV ATLAS_SECURITY_FB_PROVIDER_URL="user/oauth/facebook"
ENV ATLAS_SECURITY_FB_PROVIDER_AJAX="false"
ENV ATLAS_SECURITY_FB_PROVIDER_ICON="fab fa-facebook-f"

ENV ATLAS_SECURITY_GH_PROVIDER_ENABLED="false"
ENV ATLAS_SECURITY_GH_PROVIDER_NAME="Github"
ENV ATLAS_SECURITY_GH_PROVIDER_URL="user/oauth/github"
ENV ATLAS_SECURITY_GH_PROVIDER_AJAX="false"
ENV ATLAS_SECURITY_GH_PROVIDER_ICON="fab fa-github"

ENV ATLAS_SECURITY_DB_PROVIDER_ENABLED="false"
ENV ATLAS_SECURITY_DB_PROVIDER_NAME="DB"
ENV ATLAS_SECURITY_DB_PROVIDER_URL="user/login/db"
ENV ATLAS_SECURITY_DB_PROVIDER_AJAX="true"
ENV ATLAS_SECURITY_DB_PROVIDER_ICON="fa fa-database"
ENV ATLAS_SECURITY_DB_PROVIDER_CREDFORM="true"

ENV ATLAS_SECURITY_LDAP_PROVIDER_ENABLED="false"
ENV ATLAS_SECURITY_LDAP_PROVIDER_NAME="LDAP"
ENV ATLAS_SECURITY_LDAP_PROVIDER_URL="user/login/ldap"
ENV ATLAS_SECURITY_LDAP_PROVIDER_AJAX="true"
ENV ATLAS_SECURITY_LDAP_PROVIDER_ICON="fa fa-cubes"
ENV ATLAS_SECURITY_LDAP_PROVIDER_CREDFORM="true"

ENV ATLAS_SECURITY_SAML_PROVIDER_ENABLED="false"
ENV ATLAS_SECURITY_SAML_PROVIDER_NAME="SAML"
ENV ATLAS_SECURITY_SAML_PROVIDER_URL="user/login/saml"
ENV ATLAS_SECURITY_SAML_PROVIDER_AJAX="false"
ENV ATLAS_SECURITY_SAML_PROVIDER_ICON="fab fa-openid"

ENV ATLAS_SECURITY_AD_PROVIDER_ENABLED="false"
ENV ATLAS_SECURITY_AD_PROVIDER_NAME="Active Directory LDAP"
ENV ATLAS_SECURITY_AD_PROVIDER_URL="user/login/ad"
ENV ATLAS_SECURITY_AD_PROVIDER_AJAX="true"
ENV ATLAS_SECURITY_AD_PROVIDER_ICON="fa fa-cubes"
ENV ATLAS_SECURITY_AD_PROVIDER_CREDFORM="true"

# for existing broadsea implementations
ENV ATLAS_SECURITY_PROVIDER_ENABLED="true"
ENV ATLAS_SECURITY_PROVIDER_NAME="none"
ENV ATLAS_SECURITY_PROVIDER_TYPE="none"
ENV ATLAS_SECURITY_USE_AJAX="false"
ENV ATLAS_SECURITY_PROVIDER_ICON="fa-cubes"
ENV ATLAS_SECURITY_USE_FORM="false"

ENV ATLAS_ENABLE_TANDCS="true"
ENV ATLAS_ENABLE_PERSONCOUNT="true"
ENV ATLAS_ENABLE_TAGGING_SECTION="false"
ENV ATLAS_REFRESH_TOKEN_THRESHOLD="240"

# Configure webserver
COPY ./docker/nginx-default.conf /etc/nginx/conf.d/default.conf
COPY ./docker/optimization.conf /etc/nginx/conf.d/optimization.conf
COPY ./docker/30-atlas-env-subst.sh /docker-entrypoint.d/30-atlas-env-subst.sh

# Load code -- the actual Vite production build output (index.html + hashed
# assets/), not the raw source tree. base: '/atlas/' in vite.config.js means
# asset URLs are emitted as "/atlas/assets/...", so the *contents* of the
# outDir (js/assets/bundle/) are copied directly into the atlas/ docroot,
# not nested under it.
#
# images/ is still needed as a separate, unbundled directory: at least one
# Knockout component template (js/components/circe/components/
# GenerateComponentTemplate.html) references "images/running.png" via a
# runtime-loaded raw HTML string, which Vite's asset pipeline never sees or
# rewrites, so the path must resolve against a real images/ dir at runtime.
COPY ./images /usr/share/nginx/html/atlas/images
COPY ./README.md ./LICENSE /usr/share/nginx/html/atlas/
COPY --from=builder /code/js/assets/bundle/. /usr/share/nginx/html/atlas/

# Load Atlas runtime config with current user, so it can be modified
# with env substitution at container start
COPY --chown=101 docker/runtime-config.template.js /usr/share/nginx/html/atlas/js/runtime-config.js
