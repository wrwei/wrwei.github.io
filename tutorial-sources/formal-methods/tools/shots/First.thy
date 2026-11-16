theory First
  imports Main
begin

value "2 + 3 :: nat"

value "rev [1, 2, 3 :: nat]"

lemma "rev (rev xs) = xs"
  by simp

fun double :: "nat \<Rightarrow> nat" where
  "double n = n + n"

value "double 21"

lemma "double n = 2 * n"
  by simp

lemma "double n = n * n"
  oops

end
