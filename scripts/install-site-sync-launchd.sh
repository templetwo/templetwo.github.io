#!/usr/bin/env bash
# Install a launchd agent that keeps templetwo.github.io synced every 6 hours.
set -euo pipefail

REPO="${TEMPLE_SITE_REPO:-$HOME/templetwo.github.io}"
LABEL="com.templetwo.site-sync"
PLIST="$HOME/Library/LaunchAgents/${LABEL}.plist"
SCRIPT="$REPO/scripts/site-sync.sh"
LOG_DIR="$HOME/.temple-site-sync-logs"

chmod +x "$SCRIPT"
mkdir -p "$LOG_DIR" "$HOME/Library/LaunchAgents"

cat >"$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>${SCRIPT}</string>
  </array>
  <key>WorkingDirectory</key>
  <string>${REPO}</string>
  <key>StartInterval</key>
  <integer>21600</integer>
  <key>RunAtLoad</key>
  <true/>
  <key>StandardOutPath</key>
  <string>${LOG_DIR}/site-sync.log</string>
  <key>StandardErrorPath</key>
  <string>${LOG_DIR}/site-sync.err.log</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:${HOME}/bin</string>
    <key>TEMPLE_SITE_REPO</key>
    <string>${REPO}</string>
  </dict>
</dict>
</plist>
EOF

launchctl bootout "gui/$(id -u)/${LABEL}" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
launchctl enable "gui/$(id -u)/${LABEL}"
launchctl kickstart -k "gui/$(id -u)/${LABEL}" 2>/dev/null || true

echo "Installed ${LABEL}"
echo "  plist:  $PLIST"
echo "  script: $SCRIPT"
echo "  every:  6 hours + at login"
echo "  logs:   $LOG_DIR/"
echo "Manual:   $SCRIPT"
