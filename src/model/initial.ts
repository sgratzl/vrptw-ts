export const initialResult: any = {
  'status': 'OPTIMAL_SOLUTION',
  'solutions': [
    {
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
