import { createSelector } from 'reselect';

export const getPlots = (state) => state.plots.items;
export const getDomains = (state) => state.plots.domains;

export const getPlotIdsBySession = createSelector(
  getPlots,
  (plots) => {
    return Object.values(plots).reduce((plotsBySession, each) => ({
      ...plotsBySession,
      [each.session]: [
        ...(plotsBySession[each.session] || []),
        each.id,
      ],
    }), {});
  }
);
