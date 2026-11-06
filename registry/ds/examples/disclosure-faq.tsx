import {
  Accordion,
  Disclosure,
  DisclosurePanel,
  DisclosureTrigger,
} from '@/registry/ds/ui/disclosure';

const questions = [
  {
    id: 'trial',
    question: 'How does the 14-day trial work?',
    answer:
      'You get every feature on the Growth plan for 14 days. We do not ask for a card up front, and nothing is charged unless you choose a plan before the trial ends.',
  },
  {
    id: 'plans',
    question: 'Can I change plans later?',
    answer:
      'Yes. Upgrades apply immediately and are prorated to the day. Downgrades take effect at the start of your next billing period.',
  },
  {
    id: 'payment',
    question: 'Which payment methods do you accept?',
    answer:
      'Visa, Mastercard, American Express and SEPA Direct Debit. Annual plans can also be paid by bank transfer against an invoice.',
  },
  {
    id: 'cancel',
    question: 'What happens to my data if I cancel?',
    answer:
      'Your workspace stays readable for 30 days so you can export ledgers and invoices as CSV or PDF. After that it is deleted permanently.',
  },
];

export default function DisclosureFaq() {
  return (
    <section aria-labelledby="pricing-faq" className="flex w-full max-w-2xl flex-col gap-6">
      <h2 id="pricing-faq" className="text-headline-sm text-on-surface">
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
