#!/usr/bin/env node
import { runFlHsfPacket } from '../../../scripts/standards/fl-best-hsf-domain-scope-packet-s247.mjs';
runFlHsfPacket({ batchNumber:2, start:50, count:50, expectedCourseCounts:{
  logarithms:15, 'sequences-series':13, 'trig-functions':13, 'conic-sections':9
} });
