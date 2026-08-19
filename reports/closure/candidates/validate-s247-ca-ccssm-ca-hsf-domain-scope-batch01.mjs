#!/usr/bin/env node
import { runCaHsfPacket } from '../../../scripts/standards/ca-hsf-domain-scope-packet-s247.mjs';
runCaHsfPacket({ batchNumber:1, start:0, count:50, expectedCourseCounts:{
  'functions-and-sequences':12, 'linear-functions':12, quadratics:11, 'function-transformations':15
} });
