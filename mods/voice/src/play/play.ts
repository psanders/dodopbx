/*
 * Copyright (C) 2021 by Fonoster Inc (https://fonoster.com)
 * http://github.com/fonoster/fonos
 *
 * This file is part of Project Fonos
 *
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *    https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import objectid from "objectid";
import {Verb} from "../verb";
import {PlayOptions} from "./types";
import {objectToQString} from "../utils";
import { assertsValueIsPositive } from "../asserts";

export default class PlayVerb extends Verb {
  run(media: string, options: PlayOptions = {}): Promise<void> {

    assertsValueIsPositive("offset", options.offset);
    assertsValueIsPositive("skip", options.skip);

    const playbackId = options.playbackId ? options.playbackId : objectid();
    // Renaming properties to match the API query parameters
    const opts = {
      media,
      offsetms: options.offset,
      skipms: options.skip,
      playbackId
    };

    return new Promise(async (resolve, reject) => {
      try {
        await super.post(
          `channels/${this.request.sessionId}/play`,
          objectToQString(opts)
        );
        this.events.subscribe((event) => {
          if (event.type === "PlaybackFinished") resolve(event);
        });
      } catch (e) {
        reject(e);
      }
    });
  }
}

export {PlayOptions};