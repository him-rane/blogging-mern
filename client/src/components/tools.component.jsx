import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";

export const tools = {
  embed: Embed,
  list: { class: List, inlineToolbar: true },
  image: Image,
  header: Header,
  quote: Quote,
  marker: Marker,
  inlineCode: InlineCode,
};
