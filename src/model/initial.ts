export const initialResult: any = {
  'status': 'OPTIMAL_SOLUTION',
  'solutions': [
    {
      'assignments': {
        'successor': [11, 18, 12, 16, 2, 4, 3, 6, 7, 8, 5, 17, 10, 9, 1, 14, 15, 13],
        'vehicleOf': [3, 3, 2, 1, 3, 1, 2, 1, 2, 1, 3, 2, 1, 2, 3, 1, 2, 3],
        'arrivalTime': [4, 133, 94, 165, 77, 123, 66, 66, 4, 6, 48, 136, 0, 0, 0, 204, 169, 179],
        'startOfService': [25, 133, 94, 165, 77, 130, 66, 66, 30, 30, 48, 136, 0, 0, 0, 0, 0, 0],
        'objective': 66020
      }
    }, {
      'assignments': {
        'successor': [7, 18, 5, 16, 2, 4, 6, 12, 8, 9, 1, 17, 11, 10, 3, 14, 15, 13],
        'vehicleOf': [1, 3, 3, 1, 3, 1, 1, 2, 2, 2, 1, 2, 1, 2, 3, 1, 2, 3],
        'arrivalTime': [73, 140, 4, 165, 84, 127, 97, 97, 62, 6, 4, 150, 0, 0, 0, 204, 183, 186],
        'startOfService': [73, 140, 45, 165, 84, 130, 97, 97, 62, 30, 45, 150, 0, 0, 0, 0, 0, 0],
        'objective': 52678
      }
    }, {
      'assignments': {
        'successor': [3, 12, 7, 16, 6, 4, 8, 18, 2, 9, 5, 17, 11, 10, 1, 14, 15, 13],
        'vehicleOf': [3, 2, 3, 1, 1, 1, 3, 3, 2, 2, 1, 2, 1, 2, 3, 1, 2, 3],
        'arrivalTime': [4, 96, 48, 165, 74, 130, 89, 117, 62, 6, 4, 141, 0, 0, 0, 204, 174, 171],
        'startOfService': [25, 96, 48, 165, 74, 130, 89, 117, 62, 30, 45, 141, 0, 0, 0, 0, 0, 0],
        'objective': 51874
      }
    }, {
      'assignments': {
        'successor': [9, 18, 6, 16, 12, 4, 5, 2, 8, 7, 3, 17, 11, 10, 1, 14, 15, 13],
        'vehicleOf': [3, 3, 1, 1, 2, 1, 2, 3, 3, 2, 1, 2, 1, 2, 3, 1, 2, 3],
        'arrivalTime': [4, 135, 72, 165, 93, 112, 67, 83, 48, 6, 4, 146, 0, 0, 0, 204, 179, 181],
        'startOfService': [25, 135, 72, 165, 93, 130, 67, 83, 48, 30, 45, 146, 0, 0, 0, 0, 0, 0],
        'objective': 50770
      }
    }, {
      'assignments': {
        'successor': [11, 18, 6, 16, 12, 4, 5, 2, 7, 8, 3, 17, 1, 9, 10, 14, 15, 13],
        'vehicleOf': [1, 3, 1, 1, 2, 1, 2, 3, 2, 3, 1, 2, 1, 2, 3, 1, 2, 3],
        'arrivalTime': [4, 118, 75, 165, 92, 115, 66, 66, 4, 6, 48, 145, 0, 0, 0, 204, 178, 164],
        'startOfService': [25, 118, 75, 165, 92, 130, 66, 66, 30, 30, 48, 145, 0, 0, 0, 0, 0, 0],
        'objective': 50743
      }
    }, {
      'assignments': {
        'successor': [11, 8, 6, 16, 12, 4, 5, 18, 7, 2, 3, 17, 1, 9, 10, 14, 15, 13],
        'vehicleOf': [1, 3, 1, 1, 2, 1, 2, 3, 2, 3, 1, 2, 1, 2, 3, 1, 2, 3],
        'arrivalTime': [4, 66, 75, 165, 92, 115, 66, 108, 4, 6, 48, 145, 0, 0, 0, 204, 178, 162],
        'startOfService': [25, 66, 75, 165, 92, 130, 66, 108, 30, 30, 48, 145, 0, 0, 0, 0, 0, 0],
        'objective': 48514
      }
    }
  ],
  'header': {},
  'outputs': [
    {'key': 'successor', 'dim': 1, 'type': 'int', 'dims': ['int']},
    {'key': 'vehicleOf', 'dim': 1, 'type': 'int', 'dims': ['int']},
    {'key': 'arrivalTime', 'dim': 1, 'type': 'int', 'dims': ['int']},
    {'key': 'startOfService', 'dim': 1, 'type': 'int', 'dims': ['int']},
    {'key': 'objective', 'dim': 0, 'type': 'int'}],
  'complete': true,
  'statistics': {
    'initTime': 0.086,
    'solveTime': 1.91,
    'solutions': 6,
    'variables': 121,
    'propagators': 86,
    'propagations': 527435,
    'nodes': 4965,
    'failures': 2460,
    'restarts': 0,
    'peakDepth': 25
  }
};
