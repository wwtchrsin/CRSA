## CRSA
## A tool allowing usage of container-relative units similar to those relative to the viewport

There are a few viewport-relative units
presented in CSS, such as vh, vw, vmin, and vmax.
This tool makes it possible to refer to
some container's dimensions with the same
semantics via using auxiliary names such as
ch, cw, cmin or cmax.

Note: The dimension of a container's side being referred to
must be independent of the container's content,
e.g. be fixed or relative to an ancestor container

## Units
* **ch** equals one-hundredth of the container's height
* **cw** equals one-hundredth of the container's width
* **cmin** equals one-hundredth of the container's lesser side
* **cmax** equals one-hundredth of the container's larger side
* **cavg** equals one-hundredth of a square root of the container's area

## Usage
```javascript
(new CRSA("#container"))
    .defineStyles({
        ".description": {
            "padding": "10cmin",
            "font-size": "10cmin",
            "font-style": "italic",
        },
        ".content": {
            "padding": "10cmin",
            "font-size": "5cmin",
        },
    })
    .enableAutoRefresh();
```

## Description
* **constructor** accepts either a CSS selector string or an instance of HTMLElement
* **defineStyles()** accept an object where property names represent CSS selectors of
HTML elements to apply styles to and property values contain style rules to be applied.
First, the element is being searched within the container and if not found, in the whole document
and if not found again, the styles won't be applied. Auxiliary units **ch**, **cw**, **cmin**,
**cmax**, or **cavg** will be converted to pixels.
* **enableAutoRefresh()** defines intervals of reassessing container's dimensions.
The values are specified in milliseconds. The first argument defines the refresh interval
applied when the browser window is being resized, and the second argument defines the interval
used in any other cases. If a number equal to zero or lesser is passed the reassessment
will take place at every frame refresh. The default values of the first and second arguments 
are **-1** and **250** respectively. Auto refresh can be disabled by calling **disableAutoRefresh()**.
It is also possible to manually report the new dimensions by calling **refresh(width, height)**.
