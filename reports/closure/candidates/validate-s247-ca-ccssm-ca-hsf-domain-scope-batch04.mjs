#!/usr/bin/env node
import { runCaHsfPacket } from '../../../scripts/standards/ca-hsf-domain-scope-packet-s247.mjs';
runCaHsfPacket({ batchNumber:4, start:150, count:50, expectedCourseCounts:{
  'polar-parametric':2, 'trig-graphs-inverses':15, 'curve-analysis':16, 'derivative-rules':17
} });
