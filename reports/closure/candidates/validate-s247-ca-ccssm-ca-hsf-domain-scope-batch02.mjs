#!/usr/bin/env node
import { runCaHsfPacket } from '../../../scripts/standards/ca-hsf-domain-scope-packet-s247.mjs';
runCaHsfPacket({ batchNumber:2, start:50, count:50, expectedCourseCounts:{
  logarithms:15, 'sequences-series':13, 'trig-functions':13, 'conic-sections':9
} });
