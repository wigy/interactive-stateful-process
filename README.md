# Interactive Stateful Process

Generic base classes and utilities for implementing server-side stateful process
in React. The library is written in Typescript.

A `Process` is something that is created for one or more data entities called `ProcessFile` in this
system. Once the process is created, a `ProcessHandler` is searched that is willing to handle
that kind of file.

A `VendorState` is the JSON data structure holding the current values of various aspects of the process.
An initial state is created when the process is created and it is provided by the handler willing to
handle the file.
