# Weather Weave Dashboard

A weather visualization dashboard built using React and Leaflet, allowing users to draw polygons on a map, select a timeline range, and view color-coded weather data from the Open-Meteo API.

---

##  Setup & Run Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)

## Summary of Libraries used
| Purpose            | Library/Package                                                                 |
| ------------------ | ------------------------------------------------------------------------------- |
| Frontend Framework | [React](https://react.dev)                                                      |
| Build Tool         | [Vite](https://vitejs.dev)                                                      |
| Language Support   | TypeScript                                                                      |
| Map Integration    | [Leaflet](https://leafletjs.com), [react-leaflet](https://react-leaflet.js.org) |
| Polygon Drawing    | [leaflet-draw](https://github.com/Leaflet/Leaflet.draw)                         |
| Weather Data API   | [Open-Meteo API](https://open-meteo.com/)                                       |
| State Management   | [Zustand](https://github.com/pmndrs/zustand)                                    |
| Timeline Slider    | [react-range](https://github.com/tajo/react-range)                              |
| UI Components      | [shadcn/ui](https://ui.shadcn.com/)                                             |
| Date Handling      | [date-fns](https://date-fns.org)                                                |

## Project ScreenShort:
<img width="1915" height="947" alt="image" src="https://github.com/user-attachments/assets/181f54f1-284c-47d2-aaee-1516f57e61a1" />


### Steps to Run Locally

```bash
# Clone the repository
git clone https://github.com/shaikAkram546/Weather-weave-dash-mind-webs-project.git
cd Weather-weave-dash-mind-webs-project

# Install dependencies
npm install --legacy-peer-deps

# Start the development server
npm run dev
