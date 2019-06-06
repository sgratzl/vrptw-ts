
const cache = new Map<string, any>();

function callService(x1: number, y1: number, x2: number, y2: number) {
  const url = `https://s-cah-mwallace.infotech.monash.edu/routing/route/v1/driving/${y1},${x1};${y2},${x2}?steps=true&overview=false&annotations=true`;
  if (cache.has(url)) {
    return Promise.resolve(cache.get(url));
  }
  return fetch(url, {
    cache: 'force-cache'
  }).then((res) => res.json()).then((s) => {
    cache.set(url, s);
    return s;
  });
}

// ORDER: lng,lat
export default function computeRoute(x1: number, y1: number, x2: number, y2: number): Promise<[number, number][]> {
  return callService(x1, y1, x2, y2).then((information) => {
    const steps = information.routes[0].legs[0].steps;
    // console.log(steps);
    const wayPoints: [number, number][] = [];
    for (const step of steps) {
      // Only consider the first and last intersections per step is good enough so that the drawing line is much smoother.
      wayPoints.push(step.intersections[0].location);
      wayPoints.push(step.intersections[step.intersections.length - 1].location);

      // for (let j = 0; j < steps[i].intersections.length; j++) {
      //  wayPoints.push(steps[i].intersections[j]);
      // }
    }
    // correct order
    return wayPoints
  }).catch((error) => {
    console.error('error while computing route', error);
    // When the server is down, draw straight lines to directly connect two customers.
    return [
      [y1, x1],
      [y2, x2]
    ];
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
      return callService(x1, y1, x2, y2).then((information) => {
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
