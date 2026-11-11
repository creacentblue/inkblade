#!/bin/sh
# Rebuild index.html from src/
cd "$(dirname "$0")/src" && cat p0_head.html p1_core.js p2_art.js p3_logic.js p4_update.js p5_render.js p6_tail.html > ../index.html
