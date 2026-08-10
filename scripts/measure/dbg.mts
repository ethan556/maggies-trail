import { variantForGenForm, variantFor } from "../../src/lib/variants";
for (let i=0;i<8;i++){
  const v = variantForGenForm("reflect-compose","basisColumn",`s${i}`);
  console.log(JSON.stringify(v!.widget));
}
console.log("--- matrix-apply default ---");
for (let i=0;i<8;i++){
  const v = variantFor("matrix-apply",`s${i}`);
  console.log(JSON.stringify(v!.widget));
}
console.log("--- matrix-apply basisColumn ---");
for (let i=0;i<8;i++){
  const v = variantForGenForm("matrix-apply","basisColumn",`s${i}`);
  console.log(JSON.stringify(v!.widget));
}
