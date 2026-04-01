# Pathe Tools

**Pathe Tools** is a suite of utilities designed to simplify, automate and expedite certain parts of the daily operations in Dutch Pathé cinemas.

## Features

- Generate show schedule hand-outs for cinema workers
- Generate and automatically play show start/end announcements for cinema workers
- Control physical signage in the cinema for visitors
- Some more tools for expediting various processes

## Usage

A live demo can be found at https://qkeleq10.github.io/Pathe-Tools. For testing purposes, upload a file from RosettaBridge such as [this one](https://1drv.ms/u/c/703398955c3ef70c/EQz3PlyVmDMggHAAygEAAAABKnVDcmVGCHbutEzuJ_Nk7Q?e=nINHVR).

## Voice imports

The announcer now ships with one built-in voice (`Quinten`) plus the chime sound.

Additional voices can be imported in the announcer settings by providing a metadata JSON URL.

The JSON must contain `file` and `sprite` fields compatible with the `Voice` format; relative audio file paths are resolved relative to the JSON URL.
