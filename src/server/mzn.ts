// REST version
// import RESTMiniZinc from 'minizinc/build/RESTMiniZinc';
// export const minizinc = new RESTMiniZinc({
//   ...common
// });

// Embedded version
// import EmbeddedMiniZinc from 'minizinc/build/EmbeddedMiniZinc';
// import MZN from 'minizinc-js/bundle';
// import GECODE from 'gecode-js/bundle';

// export const minizinc = new EmbeddedMiniZinc({
//   gecode: GECODE,
//   mzn: MZN,
//   ...common
// });

// WebWorker Embedded version
import WebWorkerMiniZinc from 'minizinc/build/WebWorkerMiniZinc';
import MZN, {IMiniZincWorkerClient} from 'minizinc-js/bundle';
import GECODE, {IFznGecodeWorkerClient} from 'gecode-js/bundle';
import MiniZincWorker from 'worker-loader?name=minizinc.worker.js!minizinc-js/worker';
import GecodeWorker from 'worker-loader?name=gecode.worker.js!gecode-js/worker';

export default function createMiniZinc() {
  return new WebWorkerMiniZinc({
    mzn: () => <IMiniZincWorkerClient>MZN.createWorkerClient(new MiniZincWorker()),
    solvers: [
      () => <IFznGecodeWorkerClient>GECODE.createWorkerClient(new GecodeWorker())
    ]
  });
}
