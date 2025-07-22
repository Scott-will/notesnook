/*
This file is part of the Notesnook project (https://notesnook.com/)

Copyright (C) 2023 Streetwriters (Private) Limited

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import { Plugin, PluginKey } from "@tiptap/pm/state";
import { find } from "linkifyjs";

export function smartLinkPaste(): Plugin {
  return new Plugin({
    key: new PluginKey("smartLinkPaste"),
    props: {
      handlePaste: (view, event, slice) => {
        const clipboardData = event.clipboardData;
        const htmlContent = clipboardData?.getData("text/html");
        const textContent = clipboardData?.getData("text/plain");

        // If HTML already has links, let default behavior handle it
        if (htmlContent && htmlContent.includes("<a ")) {
          console.log("HTML contains links, using default behavior");
          return false;
        }

        if (textContent) {
          const links = find(textContent).filter((item) => item.isLink);

          if (links.length > 0) {
            const { tr, selection } = view.state;
            let pos = selection.from;

            links.forEach((link) => {
              const linkMark = view.state.schema.marks.link.create({
                href: link.href
              });
              const textNode = view.state.schema.text(link.value, [linkMark]);
              tr.insert(pos, textNode);
              pos += link.value.length;
            });

            view.dispatch(tr);
            return true; //prevent default
          }
        }

        return false;
      }
    }
  });
}
