Map to display in iframe in form in jotforms for ZSDB site registration
BASED ON chxgsxhashxdraw

Adaptions:
- put line for coordinates on top of html
- added Salamandre with a fix (still needs proper handling of data) as third WFS layer (CATEGORIE inactif will not be added) 



--- map base:

- Swiss Tile layer
- geoserver plugin
- hash plugin for CH coordinates --> creates popup with point coordinates and "copy to clipboard" - but doesn't show svp icon
	hash plugin allows to display coordinates after hash in URL to return to the URL's zoom level and coordinates
- out-commented coordinates of WGS in popup
- also added a scale bar on the bottom left

---
in addition:
- added draw plugin and adaptions from micah map
- disabled marker placement because (swiss) coordinates can be read and copied with the hash plugin
- unfortunately the hash plugin popup is in the way when placing a line (fixed to be only active when draw is not activated)
- line is still not in Swiss coordinates (fixed)
- to check: display existing ZSDB sites in map that will be included in iframe in the site registration form?
works 17.11.2025, fixed 08.01.2016

- 19.01.2026: added geoserver WFS for several layers
