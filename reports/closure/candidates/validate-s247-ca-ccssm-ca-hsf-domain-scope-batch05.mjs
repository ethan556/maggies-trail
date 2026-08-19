#!/usr/bin/env node
import { runCaHsfPacket } from '../../../scripts/standards/ca-hsf-domain-scope-packet-s247.mjs';
runCaHsfPacket({ batchNumber:5, start:200, count:49, expectedCourseCounts:{
  'derivative-rules':4, 'derivatives-in-context':11, 'integration-accumulation':16,
  'integration-applications':6, 'parametric-polar-calculus':5, 'series-convergence':7
} });
