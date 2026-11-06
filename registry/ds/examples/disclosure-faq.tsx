import {
  Accordion,
  Disclosure,
  DisclosurePanel,
  DisclosureTrigger,
} from '@/registry/ds/ui/disclosure';

const questions = [
  {
    id: 'mobile',
    question: 'Is there a mobile app?',
    answer:
      'Yes, for iOS and Android. Sign in with the same account and everything stays in sync across your devices.',
  },
  {
    id: 'offline',
    question: 'Can I use it offline?',
    answer:
      'Yes. Changes you make offline are saved on your device and sync as soon as you are back online.',
  },
  {
    id: 'export',
    question: 'How do I export my data?',
    answer:
      'Go to Settings, then Account, and select Export. You get a ZIP file with everything you created.',
  },
  {
    id: 'profile',
    question: 'Who can see my profile?',
    answer:
      'Only people you share something with. You can make your profile public in Settings, under Privacy.',
  },
];

export default function DisclosureFaq() {
  return (
    <section aria-labelledby="faq-heading" className="flex w-full max-w-2xl flex-col gap-6">
      <h2 id="faq-heading" className="text-headline-sm text-on-surface">
        Frequently asked questions
      </h2>
      <Accordion variant="plain" size="lg">
        {questions.map(({ id, question, answer }) => (
          <Disclosure key={id} id={id}>
            <DisclosureTrigger>{question}</DisclosureTrigger>
            <DisclosurePanel>{answer}</DisclosurePanel>
          </Disclosure>
        ))}
      </Accordion>
    </section>
  );
}
