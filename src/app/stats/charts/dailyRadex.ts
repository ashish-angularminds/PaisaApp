import { ChartOptions } from 'chart.js';
import { Chart } from 'chart.js/dist';
import * as helpers from 'chart.js/helpers';

const CHART_COLORS = {
    red: '#edc4ff',
    orange: '#f5758f',
    yellow: '#FFD166',
    green: '#99dbb0',
    blue: '#61deed',
  };
const colors = [CHART_COLORS.red, CHART_COLORS.orange, CHART_COLORS.yellow, CHART_COLORS.green, CHART_COLORS.blue];

const cache = new Map();
let width: any = null;
let height: any = null;

function createRadialGradient3(context: any, c1: any, c2: any, c3: any) {
    const chartArea = context.chart.chartArea;
    if (!chartArea) {
        return;
    }

    const chartWidth = chartArea.right - chartArea.left;
    const chartHeight = chartArea.bottom - chartArea.top;
    if (width !== chartWidth || height !== chartHeight) {
        cache.clear();
    }
    let gradient = cache.get(c1 + c2 + c3);
    if (!gradient) {
        width = chartWidth;
        height = chartHeight;
        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;
        const r = Math.min(
            (chartArea.right - chartArea.left) / 2,
            (chartArea.bottom - chartArea.top) / 2
        );
        const ctx = context.chart.ctx;
        gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, r);
        gradient.addColorStop(0, c1);
        gradient.addColorStop(0.5, c2);
        gradient.addColorStop(1, c3);
        cache.set(c1 + c2 + c3, gradient);
    }

    return gradient;
}


export const backgroundConfig = function (context: any) {
    let c = colors[context.dataIndex];
    if (!c) {
        return;
    }
    if (context.active) {
        c = helpers.getHoverColor(c);
    }
    const mid = helpers.color(c).desaturate(0.2).darken(0.2).rgbString();
    const start = helpers.color(c).lighten(0.2).rotate(270).rgbString();
    const end = helpers.color(c).lighten(0.1).rgbString();
    return createRadialGradient3(context, start, mid, end);
}
