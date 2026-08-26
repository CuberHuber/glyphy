---
'@glyphy/core': minor
'@glyphy/react': minor
'@glyphy/motion': minor
'@glyphy/tailwind': minor
---

The palette now reserves two colours instead of one. `accent` keeps the live
step of a flow and a new `error` takes the failed state, so an interface can
show both at once — until now they were the same terracotta and it could not.
`ink` accepts a palette name as well as a CSS colour, which is how the reserved
ones are meant to be reached: `<Glyph variant="error" ink="error" />`. The new
token arrives everywhere the others already are — `COLORS`, `CSS_VARIABLES`, the
Tailwind colour scale, the v4 stylesheet, `.glyphy-error` and
`cssVariableBlock()`.
