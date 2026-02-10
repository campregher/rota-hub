import { PayoutsController } from "./payouts.controller";
import { PayoutsService } from "./payouts.service";

describe("PayoutsController", () => {
  const payoutsService = {
    list: jest.fn()
  } as unknown as PayoutsService;

  let controller: PayoutsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new PayoutsController(payoutsService);
  });

  it("should force courier user to list only own payouts", async () => {
    await controller.list(
      { sub: "courier-1", role: "COURIER", email: "c1@rotahub.dev" },
      "courier-2"
    );

    expect(payoutsService.list).toHaveBeenCalledWith("courier-1");
  });

  it("should allow admin to filter by any courier id", async () => {
    await controller.list(
      { sub: "admin-1", role: "ADMIN", email: "admin@rotahub.dev" },
      "courier-9"
    );

    expect(payoutsService.list).toHaveBeenCalledWith("courier-9");
  });

  it("should allow admin to list payouts without filter", async () => {
    await controller.list(
      { sub: "admin-1", role: "ADMIN", email: "admin@rotahub.dev" },
      undefined
    );

    expect(payoutsService.list).toHaveBeenCalledWith(undefined);
  });
});
