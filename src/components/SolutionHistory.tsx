import React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import classNames from 'classnames';
import {scaleLinear, scaleBand} from 'd3';
import SolutionNode from '../model/SolutionNode';
import ContainerDimensions from 'react-container-dimensions';
import {IconButton, Typography, Tooltip, Popover} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import {bind} from 'decko';
import {toDistance} from '../utils';
import GalleryItem from './GalleryItem';

const styles = (_theme: Theme) => createStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0.5rem',
    '& > main': {
      flex: '1 1 0',
      display: 'flex'
    }
  },
  chart: {
    flex: '1 1 0',
    position: 'relative',
    '& > *': {
      position: 'absolute'
    }
  },
  main: {
    display: 'flex',
    '& > main': {
      flex: '1 1 0',
      display: 'flex',
      flexDirection: 'column'
    }
  },
  content: {
    flex: '1 1 0',
    position: 'relative'
  },
  bar: {
    background: 'lightgrey',
    position: 'absolute',
    bottom: 0
  },
  selected: {
    boxShadow: '0 0 5px 3px orange'
  },
  xaxis: {
    '& line': {
      stroke: 'black',
      strokeWidth: 2
    },
    '& text': {
      fontSize: 'small',
      textAnchor: 'middle',
      dominantBaseline: 'hanging'
    }
  },
  yaxis: {
    '& line': {
      stroke: 'black',
      strokeWidth: 2
    },
    '& text': {
      fontSize: 'small',
      textAnchor: 'end',
      dominantBaseline: 'central'
    }
  },
  adder: {
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
});



export interface ISolutionHistoryProps extends WithStyles<typeof styles>, IWithStore {
  className?: string;
}

@inject('store')
@observer
class HistoryBarChart extends React.Component<ISolutionHistoryProps & {width: number, height: number}> {
  // private onBarClick(solution: SolutionNode) {
  //   const store = this.props.store!;
  //   if (!store.leftSelectedSolution) {
  //     store.leftSelectedSolution = solution;
  //   } else {
  //     store.rightSelectedSolution = solution;
  //   }
  //   if (!store.gallerySolutions.includes(solution)) {
  //     store.gallerySolutions.push(solution);
  //   }
  // }

  private hoverSolutionBar(anchor: HTMLElement | null, solution: SolutionNode | null) {
    const store = this.props.store!;
    store.hoveredSolution = solution;

    if (anchor) {
      store.ui.visibleHistorySolution = solution;
      store.ui.visibleHistoryAnchor = anchor;
    }
  }

  render() {
    const {width, height, classes} = this.props;
    const store = this.props.store!;

    const left = 80;
    const bottom = 20;

    const yscale = scaleLinear().domain([0, store.maxDistance]).rangeRound([height - bottom, 20]);
    const xscale = scaleBand().domain(store.solutions.map((d) => d.name)).range([left, width - 20]).padding(0.1);

    let bandwidth = xscale.bandwidth();
    let step = xscale.step();

    if (bandwidth > 50) {
      // limit to bandwidth 50 and 5px distance
      bandwidth = 50;
      step = 5;
    }
    const start = step;


    return <article className={classes.main}>
      <svg width={left} height={height} className={classes.yaxis}>
        <g transform={`translate(${left},0)`}>
          <line y1={yscale.range()[0]} y2={yscale.range()[1]} />
          {yscale.ticks().map((s) => <g key={s} transform={`translate(0,${yscale(s)!})`} >
            <line x1={-3} />
            <text x={-5}>{toDistance(s)}</text>
          </g>)}
        </g>
      </svg>
      <main>
        <div className={classes.content}>
          {store.solutions.map((s, i) => <div
            key={s.id} className={classNames(classes.bar, {[classes.selected]: store.hoveredSolution === s})}
            style={{
              left: `${start + (bandwidth + step) * i}px`,
              width: `${bandwidth}px`,
              height: `${yscale.range()[0] - yscale(s.distance)}px`
            }}
            onMouseEnter={(evt) => this.hoverSolutionBar(evt.currentTarget, s)} onMouseLeave={() => this.hoverSolutionBar(null, null)}
          />)}
        </div>
        <svg width={width - left} height={bottom} className={classes.xaxis}>
          <line x2={xscale.range()[1]} />
          {store.solutions.map((s, i) => <g key={s.id} transform={`translate(${start + (bandwidth + step) * i + bandwidth / 2}, 0)`} >
              <line y2={3} />
              <text y={5} >{s.name}</text>
          </g>)}
        </svg>
      </main>
    </article>;


    // return <svg width={width} height={height}>
    //   <g>
    //     {store.solutions.map((s, i) => <rect
    //       key={s.id} className={classNames(classes.bar, {[classes.selected]: store.hoveredSolution === s})}
    //       x={start + (bandwidth + step) * i} y={yscale(s.distance)} width={bandwidth} height={yscale.range()[0] - yscale(s.distance)}
    //       onMouseEnter={() => store.hoveredSolution = s} onMouseLeave={() => store.hoveredSolution = null}
    //       onClick={() => this.onBarClick(s)}
    //     />)}
    //   </g>
    //   <g transform={`translate(${0},${yscale.range()[0]})`} className={classes.xaxis}>
    //     <line x1={xscale.range()[0]} x2={xscale.range()[1]} />
    //     {store.solutions.map((s, i) => <g key={s.id} transform={`translate(${start + (bandwidth + step) * i + bandwidth / 2}, 0)`} >
    //         <line y2={3} />
    //         <text y={5} >{s.name}</text>
    //     </g>)}
    //   </g>
    //   <g transform={`translate(${xscale.range()[0]},0)`} className={classes.yaxis}>
    //     <line y1={yscale.range()[0]} y2={yscale.range()[1]} />
    //     {yscale.ticks().map((s) => <g key={s} transform={`translate(0,${yscale(s)!})`} >
    //       <line x1={-3} />
    //       <text x={-5}>{yscale.tickFormat()(s)}</text>
    //     </g>)}
    //   </g>
    // </svg>;
  }
}

@inject('store')
@observer
class SolutionHistory extends React.Component<ISolutionHistoryProps> {
  @bind
  private freshSolution() {
    this.props.store!.solveFresh();
  }


  render() {
    const classes = this.props.classes;
    const store = this.props.store!;

    return <div className={classNames(classes.root, this.props.className)}>
      <Typography variant="h6">Solution History</Typography>
      <main>
        <Typography component="div" className={classes.chart}>
          <ContainerDimensions>
            {(args) => <HistoryBarChart {...args} classes={classes}/>}
          </ContainerDimensions>
        </Typography>
        <div className={classes.adder}>
          <Tooltip title="Compute New Solution">
            <IconButton onClick={this.freshSolution} color="primary">
              <AddIcon />
            </IconButton>
          </Tooltip>
        </div>
      </main>
      {store.ui.visibleHistoryAnchor && <Popover open anchorEl={store.ui.visibleHistoryAnchor} onClose={() => store.ui.visibleHistoryAnchor = null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}>
        <GalleryItem solution={store.ui.visibleHistorySolution!} asPreview />
      </Popover>}
    </div>;
  }
}

export default withStyles(styles)(SolutionHistory);
