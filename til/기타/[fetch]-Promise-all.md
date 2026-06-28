---
title: "[fetch] Promise all"
tags: []
date: 2024-08-20
notion_id: 40a5ed42-666d-44ab-9b76-8b4a9b980584
notion_last_edited: 2026-06-28T08:31:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2024-08-20

```javascript
const fetchGlampingDatasbefore = useCallback(
    async (st, ed) => {
      try {
        setIsLoading(true);
        let startDate = formatDate(st);
        let endDate = formatDate(ed);

        const { data } = await apiClient.get("/v3/glamping_reservations", {
          params: {
            start_date: startDate,
            end_date: endDate,
          },
        });
        const rsvdata = data?.data;
        const glampingItems = await getPriceData(
          startDate,
          null,
          null,
          null,
          0
        );
        const glampingTypes = await getTypes("glamping");

        const matchedGlampings = rsvdata?.map((item) => {
          const matchedPrice = glampingItems.find(
            (price) => price.glamping_type.type === item.type
          );
          const matchedType = glampingTypes?.data?.find(
            (type) => type.id === matchedPrice?.glamping_type_id
          );

          return matchedPrice
            ? {
                ...item,
                glamping_reservation_id: item.id,
                glamping_detail_id: item.id,
                glamping_type: matchedPrice.glamping_type,
                glamping_type_id: matchedPrice.glamping_type_id,
                season_type: matchedPrice.season_type,
                price: matchedPrice.price,
                name: `글램핑 ${matchedPrice.glamping_type.type}`,
                start_date: startDate,
                end_date: endDate,
                showOptions: false,
                quantity: 0,
                minimum: matchedType?.minimum || 0,
                maximum: matchedType?.maximum || 0,
              }
            : {
                ...item,
                start_date: startDate,
                end_date: endDate,
                showOptions: false,
                quantity: 0,
                minimum: matchedType?.minimum || 0,
                maximum: matchedType?.maximum || 0,
              };
        });

        setGlampings(matchedGlampings);
      } catch (err) {
        console.error("fetchGlampingDatas", err);
        handleClose();
        openAlertModal();
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDate, selectedEndDate]
  );
```


```javascript
const fetchCabanaData = async (date) => {
    try {
      setIsLoading((prev) => ({ ...prev, cabana: true }));

      const { data } = await apiClient.get(`/v3/cabana_reservations`, {
        params: {
          start_date: date,
          zone_id: selectedBuilding?.id || 1,
        },
      });
      const reservation_data = data?.data;

      const cabanaItems = await getPriceData(
        date,
        selectedTime?.id || 1,
        null,
        0
      );
      const formattedData = reservation_data?.map((item) => {
        const matchingPrice = cabanaItems.find(
          (priceItem) =>
            priceItem.cabana_type_id === item.cabana_detail.cabana_type_id
        );
        return {
          ...item.cabana_detail,
          price: matchingPrice ? matchingPrice.price : 0,
          name: matchingPrice
            ? `카바나 ${matchingPrice.time_type.type}  ${matchingPrice.date_type.type} ${item.cabana_detail.cabana_zone_type.type}${item.cabana_detail.number}`
            : "",
          start_date: date,
          end_date: date,
          quantity: 1,
          is_reservation: item.is_reservation,
        };
      });
      setCabanaSeats(formattedData);
    } catch (error) {
      console.error("fetchCabanaData Error :", error);
      handleClose();
      openAlertModal();
    } finally {
      setIsLoading((prev) => ({ ...prev, cabana: false }));
    }
  };

  const fetchTicketData = async (date) => {
    try {
      setIsLoading((prev) => ({ ...prev, ticket: true }));
      const { data } = await apiClient.get("/v2/ticket_details", {
        params: {
          start_date: date,
          end_date: date,
        },
      });
      const ticketItems = await getPriceData(date, selectedTime?.id || 1, 0);
      const matchedTickets = data.map((ticket) => {
        const matchedPrice = ticketItems?.find(
          (price) =>
            price.time_type_id === ticket.time_type_id &&
            price.ticket_type_id === ticket.ticket_type_id
        );
        return matchedPrice
          ? {
              ...ticket,
              price: matchedPrice.price,
              name: `워터파크 입장권 ${ticket.time_type_id_type.type}  ${ticket.ticket_type.type}`,
              start_date: date,
              end_date: date,
            }
          : ticket;
      });

      const filteredTickets = matchedTickets.filter(
        (ticket) => ticket.time_type_id === selectedTime.id
      );
      const initialTickets = filteredTickets.map((ticket) => ({
        ...ticket,
        quantity: 0,
      }));
      setSelectedTickets(initialTickets);
    } catch (error) {
      console.error("Error fetching ticket data:", error);
      handleClose();
      openAlertModal();
    } finally {
      setIsLoading((prev) => ({ ...prev, ticket: false }));
    }
  };
```


```javascript
const fetchGlampingDatas = useCallback(
    async (st, ed) => {
      const fetchGlampingReservationData = async (startDate, endDate) => {
        const { data } = await apiClient.get("/v3/glamping_reservations", {
          params: {
            start_date: startDate,
            end_date: endDate,
          },
        });
        return data?.data;
      };

      const fetchPriceData = async (startDate) => {
        return await getPriceData(startDate, null, null, null, 0);
      };

      const fetchGlampingTypes = async () => {
        return await getTypes("glamping");
      };

      const mapGlampingData = (
        rsvdata,
        glampingItems,
        glampingTypes,
        startDate,
        endDate
      ) => {
        return rsvdata?.map((item) => {
          const matchedPrice = glampingItems.find(
            (price) => price.glamping_type.type === item.type
          );
          const matchedType = glampingTypes?.data?.find(
            (type) => type.id === matchedPrice?.glamping_type_id
          );

          return {
            ...item,
            glamping_reservation_id: item.id,
            glamping_detail_id: item.id,
            glamping_type: matchedPrice?.glamping_type || item.glamping_type,
            glamping_type_id:
              matchedPrice?.glamping_type_id || item.glamping_type_id,
            season_type: matchedPrice?.season_type || item.season_type,
            price: matchedPrice?.price || item.price,
            name: matchedPrice
              ? `글램핑 ${matchedPrice.glamping_type.type}`
              : item.name,
            start_date: startDate,
            end_date: endDate,
            showOptions: false,
            quantity: 0,
            minimum: matchedType?.minimum || 0,
            maximum: matchedType?.maximum || 0,
          };
        });
      };

      try {
        setIsLoading(true);

        let startDate = formatDate(st);
        let endDate = formatDate(ed);
        const [rsvdata, glampingItems, glampingTypes] = await Promise.all([
          fetchGlampingReservationData(startDate, endDate),
          fetchPriceData(startDate),
          fetchGlampingTypes(),
        ]);

        const matchedGlampings = mapGlampingData(
          rsvdata,
          glampingItems,
          glampingTypes,
          startDate,
          endDate
        );
        setGlampings(matchedGlampings);
      } catch (err) {
        console.error("fetchGlampingDatas", err);
        handleClose();
        openAlertModal();
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDate, selectedEndDate]
  );
```
