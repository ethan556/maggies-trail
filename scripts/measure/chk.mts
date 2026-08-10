import { variantForGenForm } from "../../src/lib/variants";
let bad = 0;
for (let i = 0; i < 200; i++) {
  const w:any = variantForGenForm("independence-test","predictVsActual",`s${i}`)!.widget;
  const m = w.prompt.match(/Of (\d+) students, P\(bus\) = ([\d.]+) and P\(sport\) = ([\d.]+)\. The table shows (\d+)/);
  const N=+m[1], pa=+m[2], pb=+m[3], act=+m[4];
  if (act > pa*N || act > pb*N) { bad++; if (bad<3) console.log("IMPOSSIBLE:", w.prompt); }
}
console.log(bad === 0 ? "all 200 draws are internally possible" : `${bad} impossible`);
