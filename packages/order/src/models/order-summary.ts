import {
  BigNumber,
  createPsqlIndexStatementHelper,
  generateEntityId,
} from "@medusajs/utils"
import {
  BeforeCreate,
  Entity,
  ManyToOne,
  OnInit,
  PrimaryKey,
  Property,
} from "@mikro-orm/core"
import { Order } from "@models"

type OrderSummaryTotals = {
  total: BigNumber
  subtotal: BigNumber
  total_tax: BigNumber

  ordered_total: BigNumber
  fulfilled_total: BigNumber
  returned_total: BigNumber
  return_request_total: BigNumber
  write_off_total: BigNumber
  projected_total: BigNumber

  net_total: BigNumber
  net_subtotal: BigNumber
  net_total_tax: BigNumber

  future_total: BigNumber
  future_subtotal: BigNumber
  future_total_tax: BigNumber
  future_projected_total: BigNumber

  balance: BigNumber
  future_balance: BigNumber
}

const OrderIdVersionIndex = createPsqlIndexStatementHelper({
  tableName: "order_summary",
  columns: ["order_id", "version"],
})

@Entity({ tableName: "order_summary" })
@OrderIdVersionIndex.MikroORMIndex()
export default class OrderSummary {
  @PrimaryKey({ columnType: "text" })
  id: string

  @ManyToOne({
    entity: () => Order,
    columnType: "text",
    fieldName: "order_id",
    mapToPk: true,
    onDelete: "cascade",
  })
  order_id: string

  @ManyToOne(() => Order, {
    persist: false,
  })
  order: Order

  @Property({
    columnType: "integer",
    defaultRaw: "1",
  })
  version: number = 1

  @Property({ columnType: "jsonb" })
  totals: OrderSummaryTotals | null = {} as OrderSummaryTotals

  @Property({
    onCreate: () => new Date(),
    columnType: "timestamptz",
    defaultRaw: "now()",
  })
  created_at: Date

  @Property({
    onCreate: () => new Date(),
    onUpdate: () => new Date(),
    columnType: "timestamptz",
    defaultRaw: "now()",
  })
  updated_at: Date

  @BeforeCreate()
  onCreate() {
    this.id = generateEntityId(this.id, "ordsum")
    this.order_id ??= this.order?.id
  }

  @OnInit()
  onInit() {
    this.id = generateEntityId(this.id, "ordsum")
    this.order_id ??= this.order?.id
  }
}
