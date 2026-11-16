#!/bin/bash
# Retake the Isabelle/jEdit screenshots of Module 1 (src/images/jedit-*.png) on Linux.
#
#   tools/shots/jedit-shots.sh /path/to/Isabelle2026 OUTDIR
#
# Needs Xvfb, xdotool and ImageMagick. Starts Isabelle/jEdit at double scale (GDK_SCALE=2) on a virtual
# 2720x1760 display with tools/shots/First.thy copied to /home/student (so that the title bar shows a
# plain path), clicks through the steps below and writes raw screenshots to OUTDIR. The click positions
# are those of Isabelle2026's default layout; check every screenshot by eye after a new release.
# Then crop and annotate as in the last part of this script.
set -eu
ISA=${1:?Isabelle directory}; OUT=${2:?output directory}
HERE=$(cd "$(dirname "$0")" && pwd)
IMAGES=$(cd "$HERE/../../src/images" && pwd)
mkdir -p "$OUT" /home/student
cp "$HERE/First.thy" /home/student/First.thy
export DISPLAY=:97
Xvfb :97 -screen 0 2720x1760x24 >"$OUT/xvfb.log" 2>&1 &
XPID=$!
trap 'pkill -f "$ISA/contrib/jdk" || true; kill $XPID || true' EXIT
sleep 2
(cd /home/student && GDK_SCALE=2 "$ISA/Isabelle2026" First.thy >"$OUT/jedit.log" 2>&1 &)
sleep 120                                   # wait for "Prover: ready" and the theory to be checked
shot() { sleep "${2:-2}"; import -window root "$OUT/$1.png"; }
xdotool mousemove 690 1690 click 1          # open the Output panel
xdotool mousemove 1250 472 click 1          # cursor on: value "rev [1, 2, 3 :: nat]"
shot value
xdotool mousemove 1180 1070 click 1         # cursor on: lemma "double n = n * n"
shot cex
xdotool mousemove 606 1204 click 1          # tick Proof state
xdotool mousemove 1180 932 click 1          # cursor on: lemma "double n = 2 * n"
shot state
xdotool mousemove 1000 932 click 1          # end of the "oops" line ...
xdotool key shift+Home
xdotool type --delay 60 "by simp"           # ... replaced by a failing proof
xdotool mousemove 1100 932 click 1
shot error 5
for i in $(seq 1 12); do xdotool key ctrl+z; done   # restore the file in the editor (it is not saved)

# Crop and annotate (coordinates in the double-scale screenshots).
C='#EA580C'; F=$(fc-match -f '%{file}' 'DejaVu Sans:bold')
convert "$OUT/value.png" -fill none -stroke "$C" -strokewidth 7 \
  -draw "roundrectangle 566,176 2146,1132 14,14" -draw "roundrectangle 566,1168 2146,1702 14,14" \
  -draw "roundrectangle 584,1180 778,1230 8,8" -draw "roundrectangle 2174,132 2678,1712 14,14" \
  -draw "roundrectangle 38,128 546,1706 14,14" -stroke none -fill "$C" \
  -draw "circle 2080,240 2080,280" -draw "circle 2080,1420 2080,1460" -draw "circle 700,1266 700,1302" \
  -draw "circle 2440,520 2440,560" -draw "circle 470,1630 470,1670" -fill white -font "$F" -pointsize 50 \
  -gravity NorthWest -annotate +2065+210 '1' -annotate +2065+1390 '2' -annotate +686+1238 '3' \
  -annotate +2425+490 '4' -annotate +455+1600 '5' -resize 1600x -strip "$IMAGES/jedit-overview.png"
convert "$OUT/state.png" -crop 1590x912+562+800 +repage -strip "$IMAGES/jedit-state.png"
convert "$OUT/cex.png" -crop 1590x912+562+800 +repage -strip "$IMAGES/jedit-counterexample.png"
convert "$OUT/error.png" -crop 1590x1096+562+616 +repage -strip "$IMAGES/jedit-error.png"
echo "wrote $IMAGES/jedit-*.png"
