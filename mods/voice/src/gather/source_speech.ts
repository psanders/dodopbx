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
import stream from "stream";
import PubSub from "pubsub-js";
import {GatherOptions} from "./types";
import {objectToQString} from "../utils";
import {SpeechProvider} from "@fonos/common";

const waitForSpeech = async (
  sessionId: string,
  options: GatherOptions,
  verb,
  speechProvider: SpeechProvider
): Promise<string> =>
  new Promise(async (resolve, reject) => {
    let timer: NodeJS.Timeout;
    let token = null;

    const speechTracker = speechProvider.createSpeechTracker(options);
    const readable = new stream.Readable({
      // The read logic is omitted since the data is pushed to the socket
      // outside of the script's control. However, the read() function
      // must be defined.
      read() {}
    });

    token = PubSub.subscribe(`media.${sessionId}`, (type, data) => {
      readable.push(data);
    });

    speechTracker
      .transcribe(readable)
      .then((result) => {
        if (timer) clearTimeout(timer);
        resolve(result.transcription);
        PubSub.unsubscribe(token);
        // TODO: Also tell Media Server to stop sending media
      })
      .catch((e) => {
        reject(e);
        PubSub.unsubscribe(token);
      });

    await verb.post(
      `events/user/SendExternalMedia`,
      objectToQString({
        // WARNING: Harcoded value
        application: "mediacontroller"
      })
    );

    if (options.timeout > 0) {
      timer = setTimeout(() => {
        // Simply resolve an empty string
        resolve("");
        PubSub.unsubscribe(token);
        return;
      }, options.timeout);
    }
  });

export default waitForSpeech;
