# CDK Table Recreation Issue

Temp repo to demo the CDK issue we are seeing. This contains a very stripped down portion of the table module from our internal library that extends the CDK that still leads to the render issue in question.

## Setup

- Run `npm install`
- Run `npm run storybook`

Storybook should open. When the story loads you should see an iteration of this error depending upon the browser used:

```
TypeError: Cannot read properties of undefined (reading 'filter')
    at MtrTable._getOwnDefs (...)
    at MtrTable._cacheRowDefs (...)
    at MtrTable._render (...)
    at MtrTable._outletAssigned (...)
    at new FooterRowOutlet (...)
    at NodeInjectorFactory.FooterRowOutlet_Factory [as factory] (...)
    at getNodeInjectable (...)
    at instantiateAllDirectives (...)
    at createDirectivesInstances (...)
    at ɵɵelementContainerStart (...)
```