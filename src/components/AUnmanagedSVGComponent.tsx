import React from 'react';
import {bind} from 'decko';


abstract class AUnmanagedSVGComponent<T extends {width: number, height: number}, S = {}> extends React.Component<T, S> {

  private svg: SVGSVGElement | null = null;
  private updateSVG: ((props: T) => void) | null = null;

  @bind
  private assignRef(ref: SVGSVGElement | null) {
    if (this.svg === ref) {
      // same
      return;
    }
    if (!ref) {
      this.svg = null;
      this.updateSVG = null;
      return;
    }
    this.svg = ref;
    this.forceUpdate();
  }

  protected abstract initSVG(svg: SVGSVGElement, initialProps: T): (props: T) => void;

  render() {
    // run within the render method for proper mobx observations
    if (this.svg) {
      if (this.updateSVG) {
        this.updateSVG(this.props);
      } else {
        this.updateSVG = this.initSVG(this.svg, this.props);
      }
    }
    return <svg ref={this.assignRef} width={this.props.width} height={this.props.height} >{this.renderChildren()}</svg>;
  }

  protected renderChildren() {
    return [] as React.ReactNode[];
  }
}

export default AUnmanagedSVGComponent;
