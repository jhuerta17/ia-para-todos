export interface ContentDetail {
  title: string;
  summary: string;
  category: string;
  image: string;
  alt?: string;
  status: string;
  parent: string;
  parentLabel: string;
  facts?: { value: string; label: string }[];
  series?: { position: string; prev?: { url: string; title: string }; next?: { url: string; title: string } };
  sections: { heading: string; paragraphs?: string[]; bullets?: string[]; ordered?: boolean }[];
  agenda?: { time: string; block: string }[];
  gallery?: { image: string; alt: string }[];
  practice?: string;
}
