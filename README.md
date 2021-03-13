mazebrown
=========

2D arena filled with random walkers.

While the walkers move randomly on a 2D lattice within a maze of permanent walls, you can affect their progress by placing and removing temporary walls.  Coax them along a path, separate them into groups, wall them off into their own private cells, or just watch them wander about the map.

Mouse Controls
--------------

* left-click - place block
* right-click - remove block


How to Run
----------

mazebrown runs in web browsers and needs to be hosted by a webserver.  To host it, start up a webserver that gives access to the index.html file within the mazebrown top-level directory.  For example, if you have python (>=3) installed, navigate to the mazebrown directory and run

```
> python -m http.server 8000
```

This will start a server exposing that directory on port 8000.  You can then access the program by pointing your web browser to the URL `http://localhost:8000`.
