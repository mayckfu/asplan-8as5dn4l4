import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface EmendaObjetoFinalidadeProps {
  description: string
}

export const EmendaObjetoFinalidade = ({
  description,
}: EmendaObjetoFinalidadeProps) => {
  return (
    <Accordion type="single" collapsible defaultValue="item-1">
      <AccordionItem value="item-1" className="border-none">
        <AccordionTrigger className="text-lg font-semibold text-asplan-primary hover:no-underline">
          📄 Objeto e Finalidade
        </AccordionTrigger>
        <AccordionContent className="text-neutral-800 dark:text-neutral-300 leading-relaxed text-justify">
          {description}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
