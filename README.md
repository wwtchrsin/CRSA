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
    });
```

## Description
* **constructor** accepts either a CSS selector string or an instance of HTMLElement
* **defineStyles()** accept an object where the names of the object's items represent CSS selectors of
HTML elements to apply styles to and the values of the items contain style rules to be applied.
First, the element is being searched within the container and if not found, in the whole document
and if not found again, the styles won't be applied. Auxiliary units **ch**, **cw**, **cmin**,
**cmax**, or **cavg** will be converted to pixels.
* **enableAutoRefresh()** defines intervals related to representation refreshment.
The values are specified in milliseconds.  The first argument defines the interval
of reassessing container's dimensions being applied when the browser window is being resized,
the second argument defines the interval of reassessment applicable in any other cases,
and in both cases, the actual refreshment happens only if the container's dimensions have changed.
The third argument defines the interval of unconditional refreshment practical when the container's
content is meant to be changing. If some argument is assigned a number equal to or lesser than zero,
the interval is being bound to the frame rate of the browser window i.e. equal to the time span
between frames. The default values of the first, second and third arguments
are **-1**, **250** and **1e+12** respectively. Auto-refresh can be disabled by calling
**disableAutoRefresh()**. It is also possible to manually refresh the representation
by calling **refresh()**.