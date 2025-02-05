import { CalloutBox as CalloutBoxComponent } from './react/CalloutBox';
import { Podcast as PodcastComponent } from './react/Podcast';

// Export components for MDX
export const components = {
  CalloutBox: CalloutBoxComponent,
  Podcast: PodcastComponent
};

// Also export individual components
export const CalloutBox = CalloutBoxComponent;
export const Podcast = PodcastComponent; 