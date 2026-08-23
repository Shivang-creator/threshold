import { Component } from "react";

// DESIGN §8b's detection order, item 2: "an R3F error boundary around
// <Scene>." A render-time throw inside the WebGL tree (a driver quirk, a
// context creation failure that slips past the upfront probe) falls back to
// NoWebGL the same as a failed probe or a lost context — error boundaries
// require a class component, there is no hook equivalent.
export class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { crashed: false };
  }

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.crashed) return null;
    return this.props.children;
  }
}
