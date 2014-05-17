NP2 Mod Framework
====
Last Updated Nov 4 2013

Mod framework for NP2: Triton

This file does nothing itself. It should be used by other scripts in order to consistently hook into the loading process and not cause problems for each other. 

Mods must ran at document-start and use NP2M.register(name, version, pre_init_handler, post_init_handler). Using NP2M.wrap is encouraged where you don't need to completely replace a function.

