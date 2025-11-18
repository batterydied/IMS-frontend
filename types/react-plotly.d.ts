declare module "react-plotly.js" {
  import Plotly from "plotly.js-basic-dist";
  import { Component } from "react";

  interface PlotProps {
    data: any[];
    layout?: Partial<Plotly.Layout>;
    config?: Partial<Plotly.Config>;
    style?: React.CSSProperties;
    onClick?: (event: any) => void;
    onHover?: (event: any) => void;
    onSelected?: (event: any) => void;
    onUpdate?: (figure: any) => void;
    useResizeHandler?: boolean;
    className?: string;
  }

  export default class Plot extends Component<PlotProps> {}
}
