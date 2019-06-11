import {ILatLng} from '../model/interfaces';

const cache = new Map<string, any>();

function callService(steps: string) {
  if (cache.has(steps)) {
    return Promise.resolve(cache.get(steps));
  }
  const url = `https://s-cah-mwallace.infotech.monash.edu/routing/route/v1/driving/${steps}?steps=true&overview=false`;
  return fetch(url, {
    cache: 'force-cache'
  }).then((res) => res.json()).then((s) => {
    cache.set(steps, s);
    return s;
  });
}

export default function computeRoute(route: ILatLng[]): Promise<ILatLng[]> {
  const steps = route.map((l) => `${l.lng},${l.lat}`).join(';');
  return callService(steps).then((information) => {
    // console.log(steps);
    const wayPoints: ILatLng[] = [];
    const push = (loc: [number, number]) => {
      const l = ({lat: loc[1], lng: loc[0]});
      if (wayPoints.length === 0) {
        wayPoints.push(l);
        return;
      }
      // avoid duplicates
      const last = wayPoints[wayPoints.length - 1];
      if (last.lat === l.lat && last.lng === l.lng) {
        return;
      }
      wayPoints.push(l);
    };
    for (const leg of information.routes[0].legs) {
      for (const step of leg.steps) {
        for (const intersection of step.intersections) {
          push(intersection.location);
        }
      }
    }
    return wayPoints;
  }).catch((error) => {
    console.error('error while computing route', error);
    // When the server is down, draw straight lines to directly connect two customers.
    return route;
  });
}

export function computeDistanceAndTimeMatrix(locationX: number[], locationY: number[]): Promise<{distance: number[][], travelTime: number[][]}> {
  // compute the cross product of all
  return Promise.all(locationX.map((x1, i) => {
    const y1 = locationY[i];
    return Promise.all(locationX.map((x2, j) => {
      const y2 = locationY[j];
      if (i === j) {
        // itself
        return {
          distance: 0,
          travelTime: 0
        };
      }
      const steps = `${y1},${x1};${y2},${x2}`;
      return callService(steps).then((information) => {
        const distance = Math.round(information.distance);
        const travelTime = Math.round(information.duration / 60);
        return {distance, travelTime};
      });
    }));
  })).then((mixedMatrix) => {
    const distance = mixedMatrix.map((row) => row.map((v) => v.distance));
    const travelTime = mixedMatrix.map((row) => row.map((v) => v.travelTime));
    return {distance, travelTime};
  });
}
