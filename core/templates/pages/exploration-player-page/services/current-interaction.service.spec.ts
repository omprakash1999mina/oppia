// Copyright 2018 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Unit tests for CurrentInteractionService.
 */

import { TestBed } from '@angular/core/testing';

import { CurrentInteractionService } from
  'pages/exploration-player-page/services/current-interaction.service';
import { UrlService } from 'services/contextual/url.service';
import { PlayerPositionService } from
  'pages/exploration-player-page/services/player-position.service';
import { PlayerTranscriptService } from
  'pages/exploration-player-page/services/player-transcript.service';
import { StateCard } from 'domain/state_card/state-card.model';
import { ContextService } from 'services/context.service';

describe('Current Interaction Service', () => {
  let urlService: UrlService = null;
  let currentInteractionService: CurrentInteractionService = null;
  let contextService: ContextService = null;
  let DUMMY_ANSWER = 'dummy_answer';
  let playerTranscriptService: PlayerTranscriptService = null;
  let playerPositionService: PlayerPositionService = null;

  // This mock is required since ContextService is used in
  // CurrentInteractionService to obtain the explorationId. So, in the
  // tests also we need to create a mock environment of exploration editor
  // since ContextService will error if it is used outside the context
  // of an exploration.
  beforeEach(() => {
    urlService = TestBed.get(UrlService);
    spyOn(urlService, 'getPathname').and.callFake(() => {
      return '/explore/123';
    });
    currentInteractionService = TestBed.get(CurrentInteractionService);
    playerTranscriptService = TestBed.inject(PlayerTranscriptService);
    playerPositionService = TestBed.inject(PlayerPositionService);
    contextService = TestBed.inject(ContextService);
  });


  it('should properly register onSubmitFn and submitAnswerFn', () => {
    let answerState = null;
    let dummyOnSubmitFn = (answer, interactionRulesService) => {
      answerState = answer;
    };

    currentInteractionService.setOnSubmitFn(dummyOnSubmitFn);
    currentInteractionService.onSubmit(DUMMY_ANSWER, null);
    expect(answerState).toEqual(DUMMY_ANSWER);

    answerState = null;
    let dummySubmitAnswerFn = () => {
      currentInteractionService.onSubmit(DUMMY_ANSWER, null);
    };
    currentInteractionService.registerCurrentInteraction(
      dummySubmitAnswerFn, null);
    currentInteractionService.submitAnswer();
    expect(answerState).toEqual(DUMMY_ANSWER);
  });

  it('should properly register validityCheckFn', () => {
    let dummyValidityCheckFn = () => {
      return false;
    };
    let dummySubmitAnswerFn = () => {
      return false;
    };
    currentInteractionService.registerCurrentInteraction(
      dummySubmitAnswerFn, dummyValidityCheckFn);
    expect(currentInteractionService.isSubmitButtonDisabled()).toBe(
      !dummyValidityCheckFn());
  });

  it('should handle case where validityCheckFn is null', () => {
    let dummySubmitAnswerFn = () => {
      return false;
    };
    currentInteractionService.registerCurrentInteraction(
      dummySubmitAnswerFn, null);
    expect(currentInteractionService.isSubmitButtonDisabled()).toBe(false);
  });

  it('should handle case where submitAnswerFn is null', () => {
    currentInteractionService.registerCurrentInteraction(
      null, null);
    expect(currentInteractionService.isSubmitButtonDisabled()).toBe(true);
  });

  it('should properly register and clear presubmit hooks', () => {
    let hookStateA = 0;
    let hookStateB = 1;
    let hookA = () => {
      hookStateA = hookStateA + 1;
    };
    let hookB = () => {
      hookStateB = hookStateB * 3;
    };

    currentInteractionService.registerPresubmitHook(hookA);
    currentInteractionService.registerPresubmitHook(hookB);

    currentInteractionService.setOnSubmitFn(() => {});
    currentInteractionService.onSubmit(null, null);

    expect(hookStateA).toEqual(1);
    expect(hookStateB).toEqual(3);

    currentInteractionService.clearPresubmitHooks();
    currentInteractionService.onSubmit(null, null);

    expect(hookStateA).toEqual(1);
    expect(hookStateB).toEqual(3);
  });

  it('should throw error on submitting when submitAnswerFn is null', () => {
    spyOn(playerPositionService, 'getDisplayedCardIndex').and.returnValue(1);
    spyOn(playerTranscriptService, 'getCard').and.returnValue(
      StateCard.createNewCard(
        'First State', 'Content HTML',
        '<oppia-text-input-html></oppia-text-input-html>',
        null, null, null, '', null));
    spyOn(contextService, 'getExplorationId').and.returnValue('abc');
    spyOn(contextService, 'getPageContext').and.returnValue('learner');

    let additionalInfo = (
      '\nUndefined submit answer debug logs:' +
      '\nInteraction ID: null' +
      '\nExploration ID: abc' +
      '\nState Name: First State' +
      '\nContext: learner' +
      '\nErrored at index: 1');

    currentInteractionService.registerCurrentInteraction(null, null);

    expect(() => currentInteractionService.submitAnswer()).toThrowError(
      'The current interaction did not ' + 'register a _submitAnswerFn.' +
        additionalInfo);
  });

  it('should update view with new answer', () => {
    // Here, toBeDefined is used instead of testing with a value
    // because currentInteractionService.onAnswerChanged$ returns
    // observable of answerChangedSubject which is a private static
    // member of the class CurrentInteractionService and hence cannot
    // be accessed from outside. And the first toBeDefined is used
    // just to verify that updateViewWithNewAnswer is a defined function.

    expect(currentInteractionService.updateViewWithNewAnswer).toBeDefined();
    currentInteractionService.updateViewWithNewAnswer();

    expect(currentInteractionService.onAnswerChanged$).toBeDefined();
  });
});
