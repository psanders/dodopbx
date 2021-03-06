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
import {Verb} from "../verb";
import {VoiceRequest} from "../types";
import logger from "@fonos/logger";

export class PlaybackControl extends Verb {
  playbackId: string;
  constructor(request: VoiceRequest, playbackId: string) {
    super(request);
    this.playbackId = playbackId;
  }

  private async operation(name: string) {
    logger.verbose(
      `@fonos/voice calling [playbacks/${this.playbackId}/control?operation=${name}]`
    );
    await super.post(
      `playbacks/${this.playbackId}/control`,
      `operation=${name}`
    );
  }

  async restart() {
    await this.operation("restart");
  }

  async pause() {
    await this.operation("pause");
  }

  async unpause() {
    await this.operation("unpause");
  }

  async forward() {
    await this.operation("forward");
  }
}
