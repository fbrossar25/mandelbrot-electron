# How to run
npm i
npm start

# Keyboard controls
 - zsqd, wsad or arrows -> move up, down, left, right (fixed step to 0.1 on X and Y axis)
 - x -> add 10 iterations (Redraw from scratch)

# TODO
- [ ] Colors from iterations
  - [x] Grayscale
  - [x] HSL
  - [x] HSV
  - [x] Black & White
- [x] Controls to affect mandelbrot set
  - [x] Zoom
  - [x] Move
  - [x] Change parameters
- [ ] Optimisation
  - [ ] Formula (possible ?)
  - [x] Pixels manipulation instead of fillRect
  - [ ] Redraw only what's needed when moving on X and Y axis
  - [ ] Multithreading
- [ ] Save image
- [x] Make live draw optional (draw immediately at each modification)
- [ ] Distribution packages (at least Windows)