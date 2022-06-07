open Js_of_ocaml
let satosFunc x y = x - y

let _ =
  Js.export_all
    (object%js
      method satosFunc x y = x - y
      method abs x = abs_float x
      val zero = 0.
     end)