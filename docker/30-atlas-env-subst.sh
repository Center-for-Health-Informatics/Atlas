#!/bin/sh

set -e

CONFIG_PATH=${CONFIG_PATH:-/etc/atlas/config-local.js}
CONFIG_TARGET_PATH="/usr/share/nginx/html/atlas/js/runtime-config.js"

# Copy mounted configuration file if present. Note: as of the runtime-config
# rework, a mounted override must set `window.ATLAS_RUNTIME_CONFIG = {...}`
# (see docker/runtime-config.template.js), not the old AMD define() form.
if [ -f "${CONFIG_PATH}" ]; then
  echo "Using config-local.js from ${CONFIG_PATH}"
  # Don't copy but rewrite so that permissions are not changed.
  cat "${CONFIG_PATH}" > "${CONFIG_TARGET_PATH}"
fi

if [ -n "${WEBAPI_URL}" ]; then
  # make sure the WebAPI URL ends with a slash
  case $WEBAPI_URL in
    # correct, no action
    */)
      ;;
    # otherwise, add slash
    *)
      WEBAPI_URL="$WEBAPI_URL/"
      ;;
  esac
  # The slash-corrected value must be visible to `printenv` below, which
  # reads the real process environment, not this shell's local variables.
  export WEBAPI_URL

  TFILE=`mktemp`
  trap "rm -f $TFILE" 0 1 2 3 15
  cp "$CONFIG_TARGET_PATH" "$TFILE"

  # Substitute every "@@NAME@@" marker found in the template with the
  # matching environment variable's value, via sed rather than envsubst.
  # envsubst's "${VAR}" placeholder syntax collides with real JS
  # template-literal syntax (see docker/runtime-config.template.js), so this
  # uses a marker that can't be mistaken for JS. Only substitutes markers
  # actually present in the file, so unrelated environment variables (PATH,
  # HOME, etc.) are never touched. A marker with no matching env var becomes
  # an empty string, matching envsubst's behavior for unset variables.
  for name in `grep -o '@@[A-Za-z_][A-Za-z0-9_]*@@' "$TFILE" | sed 's/@@//g' | sort -u`; do
    value=`printenv "$name" 2>/dev/null` || value=""
    escaped=`printf '%s' "$value" | sed -e 's/[\/&]/\\\\&/g'`
    sed -i "s/@@${name}@@/${escaped}/g" "$TFILE"
  done

  cat "$TFILE" > "$CONFIG_TARGET_PATH"
  rm -f "$TFILE"
fi
