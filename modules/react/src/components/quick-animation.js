import React, {useState, useRef, useMemo} from 'react';
import DeckGL from '@deck.gl/react';
import {DeckScene, DeckAdapter} from '@hubble.gl/core';
import ResolutionGuide from './resolution-guide';
import BasicControls from './basic-controls';
import {useNextFrame} from '../hooks';

export const QuickAnimation = ({
  getCameraKeyframes = undefined,
  getLayerKeyframes,
  getLayers,
  initialViewState,
  timecode,
  width = 640,
  height = 480,
  formatConfigs = {},
  deckProps = {}
}) => {
  const deckRef = useRef(null);
  const deck = useMemo(() => deckRef.current && deckRef.current.deck, [deckRef.current]);
  const [busy, setBusy] = useState(false);
  const onNextFrame = useNextFrame();

  const [viewState, setViewState] = useState(initialViewState);

  const adapter = useMemo(
    () => new DeckAdapter({scene: new DeckScene({layerKeyframes: getLayerKeyframes()})}),
    []
  );

  const mergedFormatConfigs = {
    webm: {
      quality: 0.8
    },
    jpeg: {
      quality: 0.8
    },
    gif: {
      sampleInterval: 1,
      width,
      height
    },
    ...formatConfigs
  };

  const mergedTimecode = {
    framerate: 30,
    start: 0,
    ...timecode
  };

  return (
    <div style={{position: 'relative'}}>
      <div style={{position: 'absolute'}}>
        <ResolutionGuide />
      </div>
      <DeckGL
        ref={deckRef}
        viewState={viewState}
        onViewStateChange={({viewState: vs}) => {
          setViewState(vs);
        }}
        controller={true}
        width={width}
        height={height}
        {...adapter.getProps({deck, onNextFrame, getLayers, extraProps: deckProps})}
      />
      <div style={{position: 'absolute'}}>
        <BasicControls
          adapter={adapter}
          busy={busy}
          setBusy={setBusy}
          formatConfigs={mergedFormatConfigs}
          timecode={mergedTimecode}
          getCameraKeyframes={getCameraKeyframes && (() => getCameraKeyframes(viewState))}
          getLayerKeyframes={getLayerKeyframes}
        />
      </div>
    </div>
  );
};
