# ComplexNumberFunctionPlotter

An experiment in plotting complex number functions in 'pseudo-4D'

The challenge with plotting inputs and results into one picture when complex numbers are involved, is, that both the value for the input as well as the value for the output have 2 dimensions (real part and imaginary part). So together 4 dimensions are required. The 'trick' we use here is to draw lines between complex input numbers one the 'input plane' to their corresponding complex results on the 'target plane'. In that way potentially interesting behaviour can be made visible.

- regarding semantic usage of the function field please see the examples 
- width and height refer to the size of the input plane. Width 4 for instance means that the real part of the input value will go from -2 to 2.
- delta is the step-length in which the input plane will be 'walked' through to choose input values that go into the function 
- distance refers to the z-axis difference between input and target plane (or between several planes if recursion is applied)
- what happens when you click on 'next recursive step' is that the previous result values become the new input values (instead of evenly distributed input values like they spring from the original input plane). Depending on the function this can grow very quickly.

In a future version an alternative 'trick' to plot 4D will be implemented - namely creating a 3D mountain-landscape by using only one of the complex result parts (eg. real) to rise above (= z-axis) the input plane. Three of these bars at a time will be connected by a triangle with the missing part of the compelx result (e.g. imaginary) being encoded into the color of the triangle. The color-encoded 4th dimesion can be switched between all four invovled dimensions.