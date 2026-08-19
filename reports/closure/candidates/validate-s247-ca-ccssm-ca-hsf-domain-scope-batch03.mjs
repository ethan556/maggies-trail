#!/usr/bin/env node
import { runCaHsfPacket } from '../../../scripts/standards/ca-hsf-domain-scope-packet-s247.mjs';
runCaHsfPacket({ batchNumber:3, start:100, count:50, expectedCourseCounts:{
  'conic-sections':7, 'function-analysis':15, 'limits-continuity':15, 'polar-parametric':13
} });
