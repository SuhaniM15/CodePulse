import type { ReactNode } from 'react';

import { PageHeader } from '@/components/PageHeader';

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-1.5 border-t border-border pt-5 first:border-t-0 first:pt-0">
      <h2 id={id} className="m-0 text-lg font-semibold">
        {title}
      </h2>
      <div className="flex max-w-prose flex-col gap-2">{children}</div>
    </section>
  );
}

/** Static page: no API calls and no numbers other than the dataset scope the team confirmed. */
export function AboutPage() {
  return (
    <>
      <PageHeader
        title="About and limitations"
        description="Intended use, dataset scope and the limits of what CodePulse can tell you."
      />

      <div className="flex flex-col gap-6">
        <Section id="intended-use" title="Intended use">
          <p className="m-0">
            CodePulse is a decision-support tool for people who review code. A machine-learning model scores each commit by
            its estimated risk of introducing a bug, so a reviewer with limited time can look at the highest-scoring
            commits first.
          </p>
          <p className="m-0">
            The main question the interface answers is how many buggy commits are found when only the top share of commits
            is reviewed, compared with random ranking and change-size ranking.
          </p>
        </Section>

        <Section id="not-a-merge-gate" title="Not a merge gate">
          <p className="m-0">
            CodePulse does not replace code review, testing, static analysis or the judgement of the people who decide
            whether to merge a change. It must not be used as a merge gate, and a low score is not a reason to skip review.
          </p>
        </Section>

        <Section id="dataset-scope" title="Dataset scope">
          <p className="m-0">
            The model was built and evaluated on Apache Java projects, 2003–2019. Results describe how the model performed
            on that historical data.
          </p>
          <p className="m-0">
            The results in this interface are retrospective: a replay of commits whose outcomes are already known. CodePulse
            does not analyse live GitHub commits.
          </p>
        </Section>

        <Section id="other-teams" title="Use by other teams">
          <p className="m-0">
            The model should not be used for other teams, languages or projects without retraining. Its behaviour on code
            that differs from the dataset has not been evaluated.
          </p>
        </Section>

        <Section id="noisy-labels" title="Noisy labels">
          <p className="m-0">
            The buggy labels in the dataset are noisy: some commits may be labelled incorrectly. Every metric and every
            review-budget result inherits that noise, so treat them as estimates.
          </p>
        </Section>

        <Section id="scores" title="Scores are not probabilities">
          <p className="m-0">
            A risk score is a relative risk score. It ranks commits against each other. It is not a probability that a
            commit contains a bug, unless calibration has been validated and the API labels the score as a probability.
          </p>
          <p className="m-0">
            Feature importance is global and shows magnitude only. It describes the model across the evaluation data and
            does not explain why a particular commit received its score.
          </p>
        </Section>

        <Section id="limitations" title="Other limitations">
          <ul className="m-0 list-disc pl-5">
            <li>A provisional model is for integration only. It is marked as provisional wherever its results appear.</li>
            <li>Feature definitions are still being verified and are shown as &ldquo;To be confirmed&rdquo; until they are.</li>
            <li>Evaluation covers one split of the data, so results may not hold for other periods or projects.</li>
          </ul>
        </Section>

        <Section id="references" title="References">
          <p className="m-0 text-muted-foreground">References will be added here.</p>
        </Section>
      </div>
    </>
  );
}
